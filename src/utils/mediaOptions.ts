const getMedia = async (): Promise<MediaDeviceInfo[]> => {
  let devices: MediaDeviceInfo[] = [];
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    console.log('🚀 ~ getMedia ~ error:', error);
    devices = [];
  }

  return devices;
};

export { getMedia };
