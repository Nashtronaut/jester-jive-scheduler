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

export const createGroups = (data: Dancer[]): OrganizedCategories[] => {
    // Categorize and sort the data
    const categorized = sortByCategory(data);
    const sized = sortBySize(categorized);
    const fullSort = sortByLevel(sized);

    // Initialize results array
    const results: RoughGroup[] = [];

    let currentDancerId = 0;

    // Process each discipline and size
    fullSort.forEach((discipline: SortBySize) => {
        for (const key in discipline) {
            if (key === 'discipline') continue;

            const maxSize: number = key === 'solo' ? 8 :
                                    key === 'duet' ? 8 :
                                    key === 'small' ? 7 :
                                    key === 'medium' ? 5 :
                                    key === 'large' ? 4 :
                                    key === 'unplaceable' ? Infinity : 0;

            const dancers = discipline[key as keyof SortBySize];

            // Distribute dancers into groups
            let currGroup: RoughGroup = {
                category: discipline.discipline,
                size: key,
                level: [],
                dancers: []
            };

            for (const dancer of dancers) {
                dancer.id = currentDancerId++;

                if (currGroup.level.length < 3 && currGroup.dancers.length < maxSize) {
                    if (!currGroup.level.includes(dancer.level)) {
                        currGroup.level.push(dancer.level);
                    }
                    currGroup.dancers.push(dancer);
                } else {
                    results.push(currGroup);
                    currGroup = {
                        category: discipline.discipline,
                        size: key,
                        level: [dancer.level],
                        dancers: [dancer] // Start a new group with the current dancer
                    };
                }
            }

            // Push the last incomplete group
            if (currGroup.dancers.length > 0) {
                results.push(currGroup);
            }
        }
    });

    // Further processing (e.g., handling duplicates, sorting, organizing)
    const dupesFound = findSameNames(results);
    const sortedResults = sortDuplicates(results, dupesFound);
    const organizedCategories = organizeCategories(sortedResults);
    timeCategories(organizedCategories);

    return organizedCategories;
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

const timeCategories = (categories) => {
    let timeAddition = 0;
    categories.forEach((category) => {
        timeAddition = category.size === 'solo' ? 3 : category.size === 'duet' ? 3.5 : category.size === 'small' ? 4 : category.size === 'medium' ? 4 : category.size === 'large' ? 5 : 0;

        if (category.dancers.length > 0) {
            category.time = timeAddition * category.dancers.length;
        } else {
            category.time = 0;
        }
    });

    
    return categories;
};

const organizeCategories = (categories) => {
    const dancerIndices = {}; // Track dancer names and their indices in the categories array

    // Gather dancer names and their indices in the categories array
    categories.forEach((category, categoryIndex) => {
        category.dancers.forEach(dancer => {
            if (dancer.dancers_names) {
                const names = dancer.dancers_names.split(',').map(name => name.trim()); // Extract dancer names
                names.forEach(name => {
                    if (!dancerIndices[name]) {
                        dancerIndices[name] = [];
                    }
                    dancerIndices[name].push(categoryIndex);
                });
            }
        });
    });

    // Ensure categories with the same dancer names are not adjacent
    const shuffledCategories = shuffle(categories);
    const organizedCategories = [shuffledCategories[0]]; // Start with the first shuffled category

    for (let i = 1; i < shuffledCategories.length; i++) {
        const category = shuffledCategories[i];
        const lastCategory = organizedCategories[organizedCategories.length - 1];
        let shouldPush = true;

        // Check if any dancer name from the current category appears in the last category
        category.dancers.forEach(dancer => {
            if (dancer.dancers_names) {
                const names = dancer.dancers_names.split(',').map(name => name.trim());
                names.forEach(name => {
                    if (lastCategory.dancers.some(prevDancer => prevDancer.dancers_names && prevDancer.dancers_names.includes(name))) {
                        shouldPush = false;
                    }
                });
            }
        });

        if (shouldPush) {
            organizedCategories.push(category);
        } else {
            organizedCategories.unshift(category);
        }
    }

    return organizedCategories;
}

// Helper function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}