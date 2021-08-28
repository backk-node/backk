export default function getSourceFileName(fileName: string, distFolderName = 'build'): string {
  return fileName.replace(distFolderName, 'src');
}
