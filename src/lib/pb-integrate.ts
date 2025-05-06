import PocketBase from 'pocketbase';

export const cc_pb = new PocketBase('/');

export const PB_COLLECTION_USERS = 'users';
export const PB_COLLECTION_EXERCISES = 'exercises';
export const PB_COLLECTION_GAMES = 'games';
export const PB_COLLECTION_METRICS = 'metrics';
export const PB_COLLECTION_SESSIONS = 'sessions';
export const PB_COLLECTION_SESSION_EXERCISES = 'session_exercises';
export const PB_COLLECTION_SESSION_METRICS = 'session_metrics';
export const PB_COLLECTION_VIDEOS_EXERCISE = 'videos_exercise';
export const PB_COLLECTION_VIDEOS_GAMEPLAY = 'videos_gameplay';
export const PB_COLLECTION_GAMEPLAY_METRIC_EVENTS = 'gameplay_metric_events';

export const PB_COLLECTION_TO_ADD_VIDEOS = 'to_add_videos';
