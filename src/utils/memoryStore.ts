// simple in-memory maps shared by controllers/services

export const documentsMap = new Map<string, any>();
export const analysesMap = new Map<string, any>();
export const chatMessagesMap = new Map<string, any[]>();
export const usersMap = new Map<string, any>();
export const fileBuffersMap = new Map<string, Buffer>();
