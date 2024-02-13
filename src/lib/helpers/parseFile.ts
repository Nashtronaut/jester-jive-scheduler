import Papa from "papaparse";

const parseFile = async (file: FileList | undefined) => {
  if (!file || !file[0]) return;

  const fileContent = await readFile(file[0]);
  const result = Papa.parse(fileContent, {
    header: true,
    delimiter: ',',
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const data = result.data.map((row) => convertKeys(row));

  return data;
};

const readFile = (selectedFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      resolve(event.target?.result as string);
    };

    fileReader.onerror = (event) => {
      reject(event.target?.error);
    };

    fileReader.readAsText(selectedFile);
  });
};

const convertKeys = (obj: { [key: string]: string }): { [key: string]: string } => {
  const newObj: { [key: string]: string } = {};
  Object.keys(obj).forEach((key) => {
    newObj[key.replace(/ /g, '_').toLowerCase().replace('/', '_')] = obj[key];
  });

  return newObj;
};

export default parseFile;