import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateListingDialog from './CreateListingDialog';
import { api } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: { uploadMarketplaceImage: vi.fn(), createListing: vi.fn() },
}));

function renderDialog() {
  return render(<CreateListingDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />);
}

describe('CreateListingDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps creation disabled until a title and a positive price are entered', () => {
    renderDialog();
    const create = screen.getByRole('button', { name: 'Créer' });
    expect(create).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Ex: PS5'), { target: { value: 'Console' } });
    fireEvent.change(screen.getByPlaceholderText('499'), { target: { value: '0' } });
    expect(create).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('499'), { target: { value: '499' } });
    expect(create).toBeEnabled();
  });

  it('submits a valid listing through the API', async () => {
    api.createListing.mockResolvedValue({ id: 1, title: 'Console' });
    const onCreated = vi.fn();
    render(<CreateListingDialog open onOpenChange={vi.fn()} onCreated={onCreated} />);
    fireEvent.change(screen.getByPlaceholderText('Ex: PS5'), { target: { value: 'Console' } });
    fireEvent.change(screen.getByPlaceholderText('499'), { target: { value: '499' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));
    await waitFor(() => expect(api.createListing).toHaveBeenCalledWith({ title: 'Console', description: '', price: 499, image: null }));
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows a safe error message when the API rejects the listing', async () => {
    api.createListing.mockRejectedValue(new Error('Prix invalide'));
    renderDialog();
    fireEvent.change(screen.getByPlaceholderText('Ex: PS5'), { target: { value: 'Console' } });
    fireEvent.change(screen.getByPlaceholderText('499'), { target: { value: '499' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));
    expect(await screen.findByText('Prix invalide')).toBeInTheDocument();
  });
});
