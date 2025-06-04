export const formatarHoras = (nanos) => {
  if (!nanos || nanos <= 0) return '0h 0m';
  const totalSegundos = nanos / 1e9;
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  return `${horas}h ${minutos}m`;
};