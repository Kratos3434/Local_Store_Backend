import canada from 'canada';

// get array of cities and their provinces
const cities = canada.cities

export const getCities = (province: string) => {
    const results: string[] = [];
    cities.map((cityData) => {
        if (cityData[1] === province) {
            results.push(cityData[0]);
        }
    });

    return results;
}