import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { useStore } from '../store/useStore';

export function useUsers() {
    return useLiveQuery(() => db.users.toArray(), []);
}

export function useActiveUser() {
    const activeUserId = useStore((state) => state.activeUserId);
    return useLiveQuery(
        () => (activeUserId ? db.users.get(activeUserId) : undefined),
        [activeUserId]
    );
}
