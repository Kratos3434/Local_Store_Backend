import canada from 'canada';

// get array of cities and their provinces
const cities = canada.cities

const getCities = (province: string) => {
    const results: string[] = [];
    cities.map((cityData) => {
        if (cityData[1] === province) {
            results.push(cityData[0]);
        }
    });

    return results;
}

export const isValidCity = (province: string, city: string) => {
    const res = getCities(province);

    for (let i = 0; i < res.length; i++) {
        if (res[i] === city) {
            return true;
        }
    }

    return false;
}