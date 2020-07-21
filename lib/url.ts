export function generateUrlSEO(url: string) {
  return url
    .split(' ')
    .join('-')
    .toLowerCase();
}
