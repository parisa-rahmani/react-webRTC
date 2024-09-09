const startRecording = (
  stream: MediaStream | null
):
  | {
      recordedBlobs: Blob[];
      recorder: MediaRecorder;
    }
  | undefined => {
  let recordedBlobs: Blob[] = [];
  let recorder;

  if (!stream?.id) {
    alert(
      'data is un available make sure that camera is on or screen was shared'
    );

    return;
  }

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e: BlobEvent) => {
    console.log('data received when stop called ', e.data);

    recordedBlobs.push(e.data);
  };
  recorder = mediaRecorder;
  mediaRecorder.start();

  return { recordedBlobs, recorder };
};

const stopRecording = (mediaRecorder: MediaRecorder | null) => {
  if (!mediaRecorder) {
    alert('please start recording first');
    return;
  }
  mediaRecorder.stop();
};

const generateMediaPath = (blobs: Blob[]): string => {
  const buffer = new Blob(blobs);
  const videoSrc = window.URL.createObjectURL(buffer);
  return videoSrc;
};

export { startRecording, stopRecording, generateMediaPath };
