import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

export const useAlerts = () => {
    const { alerts, setAlerts } = useStore();

    const fetchAlerts = async () => {
        const { data, error } = await supabase.from('alerts').select('*');
        if (!error) setAlerts(data);
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return { alerts, fetchAlerts };
};
