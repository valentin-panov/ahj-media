export default function formatDate(date) {
  const day = date.getDate();
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formatTime = (x) => (x < 10 ? `0${x}` : x);

  return `${day} ${month} ${year} ${formatTime(hours)}:${formatTime(minutes)}`;
}
