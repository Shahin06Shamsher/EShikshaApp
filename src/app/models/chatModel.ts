export class ChatData{
    constructor(
        public role:'user'|'model',
        public parts:{text:string}[]
    ){}
}