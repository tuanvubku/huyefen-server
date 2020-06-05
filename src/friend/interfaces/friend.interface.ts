import { FriendStatuses } from '@/config/constants';

export interface IFriend {
    _id: string;
    name: string;
    avatar: string;
    numOfFriends?: number;
    status?: FriendStatuses
}