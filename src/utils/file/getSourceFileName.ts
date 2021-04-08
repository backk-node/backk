export default function getSourceFileName(fileName: string, distFolderName = 'dist'): string {
  return fileName.replace(distFolderName, 'src');
}
