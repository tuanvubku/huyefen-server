export const CONFIG_ENV_PATH: string = 'config/env';

export enum Role {
    User = "User",
    Teacher = "Teacher",
    Admin = "Admin"
};

export const TOKEN_EXPIRED = '12h';

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
    Beginner ='beginner',
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
    Newest =  'newest',
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
}