import type { Dancer, RoughGroup, SizeSort, SortByCategory, SortBySize } from "../../../types";

const sortByCategory = (data: Dancer[]) => {
    const disciplines = new Set(data.map((dancerRow: Dancer) => dancerRow.discipline));

    const dancersByCategory = Array.from(disciplines).map((discipline) => {
        const dancers = data.filter((dancerRow: Dancer) => dancerRow.discipline === discipline);
        return {
            discipline,
            dancers,
        };
    });

    return dancersByCategory;
};

const sortBySize = (data: SortByCategory[]) => {

    let result: SortBySize[] = [];

    data.map((discipline) => {
        const dancers = discipline.dancers;

        const sizes: SizeSort = {
            solo: [],
            duet: [],
            small: [],
            medium: [],
            large: [],
            unplaceable: [],
        
        };

        dancers.map((dancer) => {
            if (containsSpecificPhrase(dancer.group, "solo") || containsSpecificPhrase(dancer.group, "solo")) {
                sizes.solo.push(dancer);
            } else if (dancer.group.toLowerCase().includes('duet')) {
                sizes.duet.push(dancer);
            } else if (dancer.group.toLowerCase().includes('sm')) {
                sizes.small.push(dancer);
            } else if (dancer.group.toLowerCase().includes('med')) {
                sizes.medium.push(dancer);
            } else if (dancer.group.toLowerCase().includes('lar')) {
                sizes.large.push(dancer);
            } else {
                sizes.unplaceable.push(dancer);
            }
        });

        

        result = [
            ...result,
            {
                discipline: discipline.discipline,
                ...sizes
            }
        ];
    });

    return result;
};

const sortByLevel = (data: SortBySize[]) => {

    const fullSort = data.map((discipline) => {
        discipline.solo = discipline.solo.sort((a, b) => a.level > b.level ? 1 : -1);
        discipline.duet = discipline.duet.sort((a, b) => a.level > b.level ? 1 : -1);
        discipline.small = discipline.small.sort((a, b) => a.level > b.level ? 1 : -1);
        discipline.medium = discipline.medium.sort((a, b) => a.level > b.level ? 1 : -1);
        discipline.large = discipline.large.sort((a, b) => a.level > b.level ? 1 : -1);

        return discipline;
    });
    

    return fullSort;
};

export const createGroups = (data: Dancer[]) => {
    const categorized = sortByCategory(data);
    const sized = sortBySize(categorized);
    const fullSort = sortByLevel(sized);

    const results: RoughGroup[] = [];

    fullSort.forEach((discipline: SortBySize) => {
      for (const key in discipline) {
        if (key === 'discipline') continue;
    
        const maxSize: number = key === 'solo' ? 8 : key === 'duet' ? 8 : key === 'small' ? 7 : key === 'medium' ? 5 : key === 'large' ? 4 : 0;
        
        const dancers = discipline[key as keyof SortBySize];

        let currGroup: RoughGroup = {
          category: discipline.discipline,
          size: key,
          level: [],
          dancers: []
        };

        while (dancers.length > 0) {
            // Line 89 prevents this problem.
            const currDancer = dancers.shift();

            if (currGroup.level.length < 2 && currGroup.dancers.length < maxSize) {
                if (!currGroup.level.includes(currDancer.level)) {
                    currGroup.level.push(currDancer?.level as string);
                }

                currGroup.dancers.push(currDancer as Dancer);
            } else {
                results.push(currGroup);
                currGroup = {
                    category: discipline.discipline,
                    size: key,
                    level: [],
                    dancers: []
                };
            }
          }
        }    
    });

    const dupesFound = findSameNames(results);
    const sortedResults = sortDuplicates(results, dupesFound);

    return sortedResults;
}

export const findSameNames = (groups: RoughGroup[]) => {
    let allNames: string[] = [];
    const nameCounts: Record<string, number> = {};
  
    groups.forEach((group) => {
      if (group.dancers) {
        group.dancers.forEach((dancer) => {
            if (dancer.dancers_names) {
                allNames = [...allNames, ...dancer.dancers_names.split(', ')];
            }
        })
      }
    })

    allNames.forEach((name) => {
      if (nameCounts[name]) {
        nameCounts[name] += 1;
      } else {
        nameCounts[name] = 1;
      }
    });
  
    const duplicateNames: string[] = [];

    for (const [name, count] of Object.entries(nameCounts)) {
        if (count > 1) {
            duplicateNames.push(name);
        }
    }

    return nameCounts;
  };

const containsSpecificPhrase = (main: string, sub: string) => {
    let mainIndex = 0;
    for (const char of sub) {
      const foundIndex = main.toLowerCase().indexOf(char, mainIndex);
      if (foundIndex === -1) {
        return false;
      }
      mainIndex = foundIndex + 1;
    }
    return true;
};

const sortDuplicates = (data: RoughGroup[], nameCounts: Record<string, number>) => {
    const final: RoughGroup[] = [];
    let groupsWithDuplicates: RoughGroup[] = [];
    let groupsWithoutDuplicates: RoughGroup[] = [];

    groupsWithDuplicates = data.filter((category) => {
        let hasDuplicates = false;

         category.dancers.forEach((dancer) => {
            if (checkNames(dancer.dancers_names, Object.keys(nameCounts))) {
                hasDuplicates = true;
                return;
            }
        });

        if (hasDuplicates) {
            return category;
        }
    })

    groupsWithoutDuplicates = data.filter((category) => {
        let hasDuplicates = false;

         category.dancers.forEach((dancer) => {
            if (checkNames(dancer.dancers_names, Object.keys(nameCounts))) {
                hasDuplicates = true;
                return;
            }
    });

        if (!hasDuplicates) {
            return category;
        }
    });

    groupsWithDuplicates = randomizeOrder(groupsWithDuplicates);
    groupsWithoutDuplicates = randomizeOrder(groupsWithoutDuplicates);

    const insertionPoint = findInsertionPoint(groupsWithDuplicates, groupsWithoutDuplicates);

    if (!insertionPoint || insertionPoint === 1 ) {
        return data;
    } else {
            let tracker = 0;
            while (final.length < data.length) {
                if (groupsWithDuplicates.length > 0 && tracker % insertionPoint === 0) {
                    final.push(groupsWithDuplicates.shift() as RoughGroup);
                } else if (groupsWithoutDuplicates.length > 0 && tracker % insertionPoint !== 0) {
                    final.push(groupsWithoutDuplicates.shift() as RoughGroup);
                } else if (groupsWithoutDuplicates.length === 0) {
                    final.push(groupsWithDuplicates.shift() as RoughGroup);
                } else {
                    final.push(groupsWithoutDuplicates.shift() as RoughGroup);                    
                }

                tracker++;
            }
        }
    

    return final;
};

const findInsertionPoint = (withDuplicates: RoughGroup[], withoutDuplicates: RoughGroup[]) => {
    const withLength = withDuplicates?.length;
    const withoutLength = withoutDuplicates?.length;

    if (!withLength || !withoutLength) {
        return 1;
    }

    if (withoutLength < withLength) {
        return Math.floor(withLength / withoutLength);
    };

    if (withoutLength > withLength) {
        return Math.floor(withoutLength / withLength);
    }
}

const randomizeOrder = (groups: RoughGroup[]) => {
    // Create a copy of the array to avoid modifying the original
    const shuffledGroups = [...groups];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledGroups.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledGroups[i], shuffledGroups[j]] = [shuffledGroups[j], shuffledGroups[i]];
    }

    return shuffledGroups;
}
  
export const checkNames = (names: string | null, duplicatedNames: string[]) => {
    if (!names) {
        return false;
    }

    const namesArr = names.split(',');

    for (let i = 0; i < namesArr.length; i++) {
        if (duplicatedNames.includes(namesArr[i])) {
            return true;
        }
    }

    return false;
};