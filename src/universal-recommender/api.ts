import axiosInstance from '@/universal-recommender/axiosInstance';

export const fetchNonPersonalizedRecommend = async () => {
  const response = await axiosInstance.post('/queries', {});
  return response.data.result;
}

export const fetchPersonalizedRecommend = async (userId: string) => {
  const response = await axiosInstance.post('queries', {
    user: userId
  });
  return response.data.result;
}

export const fetchItemBaseRecommend = async (itemId: string) => {
  const response = await axiosInstance.post('queries', {
    item: itemId,
    num: 8
  });
  return response.data.result;
}

export const fetchBusinessRulesRecommendForUser = async (userId: string, rules: Array<any>) => {
  const response = await axiosInstance.post('queries', {
    user: userId,
    num: 12,
    rules: rules
  });
  return response.data.result;
}

export const inputCourseData = async (courseId: string, properties: any = {}, createdAt: string = new Date().toISOString()) => {
  await axiosInstance.post('events', {
    event: '$set',
    entityType: 'item',
    entityId: courseId,
    properties: properties,
    eventTime: createdAt
  });
}

export const inputBuyEvent = async (userId: string, courseId: string, buyTime: string = new Date().toISOString()) => {
  await axiosInstance.post('events', {
    event: 'buy',
    entityType: "user",
    entityId: userId,
    targetEntityType: "item",
    targetEntityId: courseId,
    properties: {},
    eventTime: buyTime
  });
}

export const inputViewEvent = async (userId: string, courseId: string, buyTime: string = new Date().toISOString()) => {
  await axiosInstance.post('events', {
    event: 'view',
    entityType: "user",
    entityId: userId,
    targetEntityType: "item",
    targetEntityId: courseId,
    properties: {},
    eventTime: buyTime
  });
}