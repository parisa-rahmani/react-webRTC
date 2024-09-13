import {
  ChangeEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from 'react';
import './styles.css';
import {
  generateMediaPath,
  getMedia,
  shareScreen,
  startRecording,
  stopRecording,
} from './utils';

type HTMLVideo = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject?: MediaStream;
};

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideo>(null);
  const recordVideoRef = useRef<HTMLVideo>(null);

  const shareMedia = async () => {
    let streamObject;
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        googNoiseReduction: true,
      },
      video: {
        width: { max: 720 },
        height: { min: 720 },
      },
    };

    if (stream?.id) return;

    try {
      setLoading(true);
      streamObject = await navigator.mediaDevices.getUserMedia(constraints);

      if (streamObject) {
        setStream(streamObject);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    return streamObject;
  };

  const showVideo = async () => {
    let streamObj;
    if (!stream?.id) {
      streamObj = await shareMedia();
    } else {
      streamObj = stream;
    }

    if (Boolean(videoRef.current?.srcObject?.active)) return;

    if (videoRef?.current) {
      videoRef.current.srcObject = streamObj;
    }
  };

  const stopVideo = () => {
    setStream(null);

    if (!stream?.id) return;

    const tracks = stream.getTracks();

    tracks.forEach(track => {
      track.stop();
    });

    if (videoRef.current) {
      videoRef.current.srcObject = undefined;
    }
  };

  const changeSize = () => {
    if (!stream?.id) return;

    stream.getVideoTracks().forEach(track => {
      const capabilities = track.getCapabilities();
      console.log('hello', capabilities);

      // @ts-ignore
      const width = document.querySelector('#width')?.value || 0;
      // @ts-ignore
      const height = document.querySelector('#height')?.value || 0;

      const videoConstraints = {
        width,
        height,
      };

      track.applyConstraints(videoConstraints);
    });
  };

  const startRecordingHandler = (stream: MediaStream | null) => {
    const { recorder, recordedBlobs } = startRecording(stream) || {};

    if (recordedBlobs) setRecordedBlobs(recordedBlobs);
    if (recorder) setMediaRecorder(recorder);
  };

  const stopRecordingHandler = () => {
    stopRecording(mediaRecorder);
  };

  const playRecordHandler = (
    node: RefObject<VideoHTMLAttributes<HTMLVideoElement>>
  ) => {
    const videoSrc = generateMediaPath(recordedBlobs);
    if (node.current) node.current.src = videoSrc;
  };

  const shareScreenHandler = async () => {
    if (screenStream?.id) return;
    const streamObject = await shareScreen();
    if (streamObject) {
      setScreenStream(streamObject);
    }
  };

  const changeAudioInput = async (e: ChangeEvent<HTMLSelectElement>) => {
    let streamObj;
    //changed audio input!!!
    const deviceId = e.target.value;
    const newConstraints = {
      audio: { deviceId: { exact: deviceId } },
      video: true,
    };
    try {
      streamObj = await navigator.mediaDevices.getUserMedia(newConstraints);
      console.log(streamObj);
      setStream(streamObj);
      const tracks = streamObj.getAudioTracks();
      console.log(tracks);
    } catch (err) {
      console.log(err);
    }
  };

  const changeAudioOutput = async (e: ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;

    if (videoRef.current) {
      // @ts-ignore
      videoRef.current.pause();
      // @ts-ignore
      await videoRef.current.setSinkId(deviceId);
      // @ts-ignore

      videoRef.current.play();
    }

    console.log('Changed audio device!');
  };

  const changeVideo = async (e: ChangeEvent<HTMLSelectElement>) => {
    let streamObj;

    //changed video input!!!
    const deviceId = e.target.value;
    const newConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      streamObj = await navigator.mediaDevices.getUserMedia(newConstraints);
      const tracks = streamObj.getVideoTracks();
      console.log(tracks);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const initiateDevices = async () => {
      const devices = await getMedia();
      setDevices(devices);
    };

    initiateDevices();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="videos">
          <div className="myfeed">
            <h3>My feed</h3>
            <video
              id="my-video"
              className="video"
              autoPlay
              playsInline
              // @ts-ignore
              ref={videoRef}
            ></video>
          </div>

          <div className="otherfeed">
            <h3>recorded video</h3>
            <video
              id="other-video"
              className="video"
              playsInline
              controls
              // @ts-ignore
              ref={recordVideoRef}
            ></video>
          </div>
        </div>
        <div className="actions">
          <button id="share" onClick={shareMedia} disabled={loading}>
            share my mic and camera
          </button>

          <button id="show-video" onClick={showVideo} disabled={loading}>
            show my video
          </button>

          <button id="stop-video" onClick={stopVideo}>
            stop my video
          </button>

          <div className="row">
            <button id="change-video-size" onClick={changeSize}>
              change video size
            </button>
            <input type="text" id="width" placeholder="width" />
            <input type="text" id="height" placeholder="height" />
          </div>

          <div className="row py-4">
            <button
              id="start-record"
              onClick={() => startRecordingHandler(stream)}
            >
              start recording
            </button>

            <button
              id="start-record-screen"
              onClick={() => startRecordingHandler(screenStream)}
            >
              start recording my screen
            </button>
            <button id="stop-record" onClick={stopRecordingHandler}>
              stop recording
            </button>
            <button
              id="play-record"
              onClick={() => playRecordHandler(recordVideoRef)}
            >
              play record
            </button>
          </div>

          <button id="share-screen" onClick={shareScreenHandler}>
            share screen
          </button>

          <div className="row">
            <label htmlFor="audio-input">choose input audio</label>
            <select id="audio-input" onChange={e => changeAudioInput(e)}>
              {devices
                .filter(device => device.kind === 'audioinput')
                .map(device => {
                  return (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="row">
            <label htmlFor="audio-output">choose output audio</label>
            <select id="audio-output" onChange={changeAudioOutput}>
              {devices
                .filter(device => device.kind === 'audiooutput')
                .map(device => {
                  return (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="row">
            <label htmlFor="video-input">choose input video</label>
            <select id="video-input" onChange={e => changeVideo(e)}>
              {devices
                .filter(device => device.kind === 'videoinput')
                .map(device => {
                  return (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  );
                })}
            </select>
          </div>

          <button id="accept-offer">accept an offer</button>
        </div>
      </div>
    </div>
  );
}
