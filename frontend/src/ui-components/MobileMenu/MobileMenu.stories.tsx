import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MobileMenu from './MobileMenu';

const meta: Meta<typeof MobileMenu> = {
  title: 'Components/MobileMenu',
  component: MobileMenu,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => alert('Menu closed'),
    mainLinks: [
      { href: '/', label: 'Home' },
      { href: '/templates', label: 'Invitation Templates' },
      { href: '/invitations/create', label: 'Create Invitation' },
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
    ]
  },
};

export default meta;
type Story = StoryObj<typeof MobileMenu>;

export const Default: Story = {};

export const LoggedOut: Story = {};
