export function validatePassword(password: string) {
    return password.length > 6;
} 

export function checkValidObjecID(ids: string[]) {
    ids.forEach(id => {
        if (!id.match(/^[0-9a-fA-F]{24}$/))
            return false;
    })
    return true;
}