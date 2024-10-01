import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { unlink } from 'fs/promises';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

@Injectable()
export class FsService {
    constructor(private readonly httpService: HttpService) {
        ffmpeg.setFfmpegPath(installer.path);
    }
    async toMp3(input: string, output: string): Promise<string | void> {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        this.removeFile(input);
                        resolve(outputPath);
                    })
                    .on('error', (err) => reject(err.message))
                    .run();
            });
        } catch (error) {
            console.log('Error creating mp3 message', error.message);
        }
    }

    async downloadFile(url: string, filename: string, extension: string): Promise<string> {
        try {
            const filePath = resolve(__dirname, '../voices', `${filename}.${extension}`);

            // Выполняем HTTP-запрос и ждем ответ
            const response = await axios.get(url, {
                responseType: 'stream',
            });

            return new Promise((resolve, reject) => {
                const stream = createWriteStream(filePath);

                // Передаём поток данных из ответа в файл
                response.data.pipe(stream);

                stream.on('finish', () => resolve(filePath));
                stream.on('error', (err) => {
                    // Удаляем частично загруженный файл при ошибке
                    unlink(filePath);
                    reject(
                        new HttpException(`Error writing the file: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR),
                    );
                });
            });
        } catch (error) {
            throw new HttpException(`Error downloading the file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeFile(path: string) {
        try {
            await unlink(path);
        } catch (error) {
            console.log('Error while removing file', error.message);
        }
    }
}
