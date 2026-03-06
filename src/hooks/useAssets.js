import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

export const useAssets = () => {
    const { assets, setAssets } = useStore();

    const fetchAssets = async () => {
        const { data, error } = await supabase.from('assets').select('*');
        if (!error) setAssets(data);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    return { assets, fetchAssets };
};
