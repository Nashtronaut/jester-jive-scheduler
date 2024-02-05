import type { RoughGroup } from "../../../types";
import { writeTextFile, createDir, exists, BaseDirectory } from '@tauri-apps/api/fs';

export const writeSchedule = async (categories: RoughGroup[]) => {
    await makeDir();

    let csvValues = ``;
    
    categories.forEach((category, index) => {
        csvValues += `GROUP ${index + 1}\n`
        csvValues += `Category: ${category.category},Size: ${category.size.slice(0, 1).toUpperCase() + category.size.slice(1)},Levels: ${category.level.join(' + ')},Time: ${category.time} mins\n`;
        csvValues += `Name,Age,Level,Discipline,Performance/Competition,Group,Number Of Dancers,Dancers,Studio\n`;

        category.dancers.forEach((dancer) => {
            csvValues += `${dancer.name},${dancer.age},${dancer.level},${dancer.discipline},${dancer.perf_comp},${dancer.group},${dancer.dancers_names?.split(',').length ?? 'Unknown'},${dancer.dancers_names ? '"' + dancer.dancers_names + '"': 'Unknown'},${dancer.studio}\n`;
        });

        csvValues += ',,,,,,,,\n,,,,,,,\n';
    })

    await writeTextFile('generatedSchedule.csv', csvValues, {
        dir: BaseDirectory.AppData,
        append: false
    });
};

const makeDir = async () => {
    try {
      if (!(await exists("", { dir: BaseDirectory.AppData }))) {
        await createDir("", { dir: BaseDirectory.AppData });
      }
    } catch (err: any) {
      console.log(err);
    }
}