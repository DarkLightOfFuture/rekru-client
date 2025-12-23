import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

import '@testing-library/jest-dom';

global.fetch = vi.fn();

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        global.addEventListener('unhandledrejection', (e) => {
            e.preventDefault();
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('must show loading state initially', () => {
        (fetch as vi.Mock).mockImplementation(() =>
            new Promise(() => { })
        );

        render(<App />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('must display error message when fetch fails', async () => {
        (fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('must update hours input correctly', async () => {
        const mockEnergyData = {
            period: { from: '2025-12-01', to: '2025-12-03' },
            days: []
        };

        (fetch as vi.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockEnergyData
        });

        render(<App />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Charging Duration/i)).toBeInTheDocument();
        });

        const hoursInput = screen.getByLabelText(/Charging Duration/i) as HTMLInputElement;

        expect(hoursInput.value).toBe('3');
        fireEvent.change(hoursInput, { target: { value: '5' } });
        expect(hoursInput.value).toBe('5');
    });

    it('must fetch optimal charging window when button is clicked', async () => {
        const mockEnergyData = {
            period: { from: '2025-12-01', to: '2025-12-03' },
            days: []
        };

        const mockChargingData = {
            hours: 3,
            optimalWindow: {
                startTime: '2025-12-02T00:00:00Z',
                endTime: '2025-12-02T03:00:00Z',
                averageCleanEnergyPercent: 65.5
            }
        };

        (fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockEnergyData
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockChargingData
            });

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Find Optimal Window')).toBeInTheDocument();
        });

        const button = screen.getByText('Find Optimal Window');
        fireEvent.click(button);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/optimal-charging-window?hours=3', {
                method: "GET"
            });
        });
    });

    it('must show charging window results after successful fetch', async () => {
        const mockEnergyData = {
            period: { from: '2025-12-01', to: '2025-12-03' },
            days: []
        };

        const mockChargingData = {
            hours: 3,
            optimalWindow: {
                startTime: '2025-12-02T00:00:00Z',
                endTime: '2025-12-02T03:00:00Z',
                averageCleanEnergyPercent: 65.5
            }
        };

        (fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockEnergyData
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockChargingData
            });

        render(<App />);

        await waitFor(() => {
            const button = screen.getByText('Find Optimal Window');
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(screen.getByText('Optimal Charging Window Found!')).toBeInTheDocument();
            expect(screen.getByText('65.5%')).toBeInTheDocument();
        });
    });
});