import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => vi.unstubAllGlobals());

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

  it('uploads a supported image then saves its returned URL on the listing', async () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:listing-preview'),
      revokeObjectURL: vi.fn(),
    });
    api.uploadMarketplaceImage.mockResolvedValue({ imageUrl: '/media/marketplace/listing-demo.jpg' });
    api.createListing.mockResolvedValue({ id: 2, title: 'Console' });
    renderDialog();
    fireEvent.change(screen.getByPlaceholderText('Ex: PS5'), { target: { value: 'Console' } });
    fireEvent.change(screen.getByPlaceholderText('499'), { target: { value: '499' } });
    const file = new File(['fake-png'], 'console.png', { type: 'image/png' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => expect(api.uploadMarketplaceImage).toHaveBeenCalledWith(file));
    await waitFor(() => expect(api.createListing).toHaveBeenCalledWith({
      title: 'Console', description: '', price: 499, image: '/media/marketplace/listing-demo.jpg',
    }));
  });

  it('rejects image formats that the backend does not accept', async () => {
    renderDialog();
    const file = new File(['image'], 'animated.gif', { type: 'image/gif' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });

    expect(await screen.findByText('Formats acceptés : JPEG, PNG ou WebP.')).toBeInTheDocument();
    expect(api.uploadMarketplaceImage).not.toHaveBeenCalled();
  });
});
