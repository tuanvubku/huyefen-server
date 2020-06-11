import { emit } from "cluster";

export const CONFIG_ENV_PATH: string = 'config/env';

export const TOKEN_EXPIRED = '12h';

export const SIZE_LIMIT = 5 * 1024 * 1024

export enum Role {
    User = "User",
    Teacher = "Teacher",
    Admin = "Admin"
};


export enum FriendStatuses {
    NoFriend = 1,
    SentInvitation = 2,
    ReceivedInvitation = 3,
    Friend = 4
};

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
};

export enum Level {
    AllLevel = 'allLevel',
    Beginner = 'beginner',
    Intermediate = 'intermediate',
    Expert = 'expert'
};

export enum Privacy {
    Draft = 'draft',
    Public = 'public',
    Password = 'password',
    Private = 'private'
};

export enum Price {
    Free = 'free',
    TierOne = 'tier1',
    TierTwo = 'tier2',
    TierThree = 'tier3'
};

export enum TeacherCoursesSort {
    Newest = 'newest',
    Oldest = 'oldest',
    AtoZ = 'a-z',
    ZtoA = 'z-a'
}

export enum ProgressBase {
    Goals = 1 / 6,
    Syllabus = 1 / 9,
    Landing = 5 / 9,
    Price = 1 / 18,
    Messages = 1 / 9
};

export enum Lecture {
    Article = 'Article',
    Video = 'Video'
};

export enum HistoryType {
    Goals = 0,
    Syllabus = 1,
    Landing = 2,
    Price = 3,
    Messages = 4,
    Lecture = 5
};

export enum HistorySort {
    Newest = 'newest',
    Oldest = 'oldest'
};

export enum ValidateStatus {
    OK = 0,
    InvalidCourse = 1,
    InvalidTeacher = 2
};

export enum Permission {
    Announcement = 0,
    Review = 1,
    Privacy = 2,
    Messenger = 3,
    Invite = 4,
    Default = 5
}

export enum Comment {
    User = "User",
    Teacher = "Teacher"
};


export enum Notification {
    Friend = 'friend',
    Recommend = 'recommend'
};

export enum Push {
    Messenger = 'messenger',
    Notification = 'notification'
};