export function success(data) {
    if(!data) 
        data = {}
    return {
        success: true,
        data: data
    }
}