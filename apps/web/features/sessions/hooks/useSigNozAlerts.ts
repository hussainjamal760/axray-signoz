import { useQuery } from '@tanstack/react-query';

const fetchSigNozAlerts = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/signoz/alerts`);
  if (!res.ok) throw new Error('Failed to fetch SigNoz alerts');
  const json = await res.json();
  return json.data?.content || [];
};

export const useSigNozAlerts = () => {
  return useQuery({
    queryKey: ['signoz-alerts'],
    queryFn: fetchSigNozAlerts,
    refetchInterval: 30000, // refresh every 30 seconds
  });
};
