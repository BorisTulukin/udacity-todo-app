
export function apiResponseHelper(code: number, bodyString: string) {

    return {
        statusCode: code,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: bodyString
    }  
}