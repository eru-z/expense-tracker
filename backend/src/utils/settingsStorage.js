import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "user_settings";

export const saveSettings = async settings => {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
};

export const loadSettings = async () => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
};
