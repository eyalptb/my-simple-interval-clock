
export const loadAudioBuffer = async (
  audioContext: AudioContext,
  url: string
): Promise<AudioBuffer> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error loading audio buffer:', error);
    throw error;
  }
};
