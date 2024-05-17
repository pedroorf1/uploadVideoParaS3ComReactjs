import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpegInstance = createFFmpeg({ log: true });

export async function compressAndConvertToHLS(file) {
    await ffmpegInstance.load().then(() => console.log('loaded'));


    // Promise.resolve(async (resolve, reject) => {
    //     resolve(await ffmpegInstance.load());
    //     reject('Error loading ffmpeg instance');
    // })
    // if (!ffmpegInstance.isLoaded()) {
    //     // await ffmpegInstance.load();
    //     try {
    //         await ffmpegInstance.load();
    //     } catch (error) {
    //         console.error("Error loading ffmpeg instance:", error);
    //     }
    // }
    const currentTime = new Date();
    const timestamp = Math.floor(currentTime.getTime() / 1000)
    const originalName = file.name.split('.').slice(0, -1).join('.');
    const finalName = `${originalName}-${timestamp}`;

    alert('Comprimindo e convertendo vídeo...');
    ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(file));

    await ffmpegInstance.run(
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-b:v', '500k',
        '-c:a', 'aac',
        '-b:a', '64k',
        '-hls_time', '2',
        '-hls_list_size', '0',
        '-f', 'hls',
        `${finalName}.m3u8`
    );

    const dataM3U8 = ffmpegInstance.FS('readFile', `${finalName}.m3u8`);
    const blobM3U8 = new Blob([dataM3U8.buffer], { type: 'application/vnd.apple.mpegurl' });

    const files = ffmpegInstance.FS('readdir', '/').filter(file => file.endsWith('.ts'));
    const blobs = files.map(file => {
        const data = ffmpegInstance.FS('readFile', file);
        return new Blob([data.buffer], { type: 'video/mp2t' });
    });

    const formData = new FormData();
    formData.append('file', blobM3U8, `${finalName}.m3u8`);
    files.forEach((file, index) => {
        formData.append('file', blobs[index], `${finalName}-${index}.ts`);
    });

    alert('Enviando o vídeo para o servidor...');
    try {
        const response = await fetch('http://localhost:3000/videos/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const responseData = await response.json();
            return {
                message: `Upload bem-sucedido, file: ${responseData.url}`
            };
        } else {
            return {
                message: `Falha no upload: ${response.statusText}`
            };
        }
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return { message: 'Falha ao fazer upload' };
    }
}

// const videoFileInput = document.getElementById('video-file-input');
// videoFileInput.addEventListener('change', async (event) => {
//     console.log('evento')
//     const videoFile = event.target.files[0];
//     if (videoFile) {
//         console.log('arquivo', videoFile)
//         await compressAndConvertToHLS(videoFile);
//     }
// });
