import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import fs, { createWriteStream } from 'fs';
import {writeFile} from 'fs/promises'
import { resolve } from 'path';
import { unlink } from 'fs/promises';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

// Раскомментировать если нужно конвертировать ogg в mp3, так как в официальной документации openai не поддерживается формат ogg, но по факту все работает

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const installer = require('@ffmpeg-installer/ffmpeg');

@Injectable()
export class FilesService {
    constructor(private readonly httpService: HttpService) {
        // ffmpeg.setFfmpegPath(installer.path);
    }
    // async convertToMp3(inputPath: string, outputFilename: string): Promise<string> {
    //     const rootPath = resolve(__dirname, '../../');
    //     const outputPath = resolve(rootPath, 'temp', `${outputFilename}.mp3`);

    //     return new Promise((resolve, reject) => {
    //         ffmpeg(inputPath)
    //             .inputOption('-t 30')
    //             .output(outputPath)
    //             .on('end', () => {
    //                 this.removeFile(inputPath);
    //                 resolve(outputPath);
    //             })
    //             .on('error', reject)
    //             .run();
    //     });
    // }

    async downloadFile(url: string, filename: string, extension: string): Promise<string> {
        try {
            const rootPath = resolve(__dirname, '../../');
            const filePath = resolve(rootPath, 'temp', `${filename}.${extension}`);

            const response = await axios.get(url, {
                responseType: 'stream',
            });

            return new Promise((resolve, reject) => {
                const stream = createWriteStream(filePath);

                response.data.pipe(stream);

                stream.on('finish', () => resolve(filePath));
                stream.on('error', (err) => {
                    unlink(filePath);
                    reject(new HttpException(`Error writing the file: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR));
                });
            });
        } catch (error) {
            throw new HttpException(`Error downloading the file: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async writeFile (filename: string, buffer: Buffer, extension: string) {
        const rootPath = resolve(__dirname, '../../');
        const filePath = resolve(rootPath, 'temp', `${filename}.${extension}`);

        await writeFile(filePath, buffer);

        return filePath;
    }

    async removeFile(path: string) {
        try {
            await unlink(path);
        } catch (error) {
            console.log('Error while removing file', error.message);
        }
    }
}
