import { colors } from "../config/constants.js";

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export { getRandomColor }
