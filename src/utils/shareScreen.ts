const shareScreen = async () => {
  let streamObject;
  const options = {
    video: true,
    audio: false,
    surfaceSwitching: 'include',
  };

  try {
    streamObject = await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    console.log(error);
  }

  return streamObject;
};

export { shareScreen };
