import "./styles.css";
import { useState, useRef, VideoHTMLAttributes } from "react";

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
  const [recordedBlobls, setRecordedBlobls] = useState([]);
  console.log({ stream });

  const videoRef = useRef<HTMLVideo>(null);
  const recordVideoRef = useRef<HTMLVideo>(null);

  const shareMedia = async () => {
    let streamObject;
    const constraints = {
      audio: true,
      video: {
        width: { max: 1920 },
        heigth: { min: 1080 },
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
    console.log({ tracks });
    tracks.forEach((track) => {
      track.stop();
    });

    if (videoRef.current) {
      videoRef.current.srcObject = undefined;
    }
  };

  const changeSize = () => {
    if (!stream?.id) return;

    stream.getVideoTracks().forEach((track) => {
      const capabilities = track.getCapabilities();
      console.log("hello", capabilities);

      // @ts-ignore
      const width = document.querySelector("#width")?.value || 0;
      // @ts-ignore
      const height = document.querySelector("#height")?.value || 0;

      const videoConstraints = {
        width,
        height,
      };

      track.applyConstraints(videoConstraints);
    });
  };

  const startRecording = () => {
    if (!stream?.id) {
      alert("please turn on your camera first");

      return;
    }

    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      console.log("data recived, ", e.data);

      setRecordedBlobls([e.data]);
    };
    setMediaRecorder(recorder);
    recorder.start();
  };

  const stopRecording = () => {
    if (!mediaRecorder) {
      alert("please start recording first");
      return;
    }
    mediaRecorder.stop();
  };

  const playRecord = () => {
    const buffer = new Blob(recordedBlobls);
    if (recordVideoRef.current)
      recordVideoRef.current.src = window.URL.createObjectURL(buffer);
  };

  const shareScreen = async () => {
    let streamObject;
    const options = {
      video: true,
      audio: false,
      surfaceSwitching: "include",
    };

    if (screenStream?.id) return;
    try {
      streamObject = await navigator.mediaDevices.getDisplayMedia(options);
      if (streamObject) {
        setScreenStream(streamObject);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
            <button id="start-record" onClick={startRecording}>
              start recording
            </button>
            <button id="stop-record" onClick={stopRecording}>
              stop recording
            </button>
            <button id="play-record" onClick={playRecord}>
              play record
            </button>
          </div>

          <button id="share-screen" onClick={shareScreen}>
            share screen
          </button>

          <button id="make-offer">make an offer</button>
          <button id="accept-offer">accept an offer</button>
        </div>
      </div>
    </div>
  );
}
