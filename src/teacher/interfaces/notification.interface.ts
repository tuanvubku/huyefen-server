export interface INotification {
    _id: string,
    type: number,
	content: string,
	avatar: string,
    owner: {
		_id: string,
		avatar: string,
		name: string
    },
    ownerType: string,
    createdAt: Date,
    seen: boolean
};