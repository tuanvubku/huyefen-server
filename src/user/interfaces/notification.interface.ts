export interface INotification {
    _id: string,
    type: number,
	content: string,
	avatar: string,
    user: {
		_id: string,
		avatar: string,
		name: string
	},
    createdAt: Date,
    seen: boolean
};