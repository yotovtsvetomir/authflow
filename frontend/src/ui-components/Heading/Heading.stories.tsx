import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Heading size="3xl">Heading 3XL</Heading>
      <Heading size="2xl">Heading 2XL</Heading>
      <Heading size="xl">Heading XL</Heading>
      <Heading size="lg">Heading LG</Heading>
      <Heading size="md">Heading MD</Heading>
      <Heading size="sm">Heading SM</Heading>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <>
      <Heading align="left">Alignment: Left</Heading>
      <Heading align="center">Alignment: Center</Heading>
      <Heading align="right">Alignment: Right</Heading>
    </>
  ),
};

export const Weights: Story = {
  render: () => (
    <>
      <Heading weight="medium">Weight: Medium</Heading>
      <Heading weight="semi">Weight: Semi</Heading>
      <Heading weight="bold">Weight: Bold</Heading>
      <Heading weight="extrabold">Weight: ExtraBold</Heading>
    </>
  ),
};

export const CustomTag: Story = {
  render: () => (
    <>
      <Heading as="h1">H1 Tag</Heading>
      <Heading as="h2">H2 Tag</Heading>
      <Heading as="h3">H3 Tag</Heading>
    </>
  ),
};

export const Colors: Story = {
  render: () => (
    <>
      <Heading color="default">Dark Text</Heading>
      <Heading color="highlight">Highlighted Text</Heading>
      <div style={{ background: '#2F3038', padding: '0.1rem' }}>
        <Heading color="white">White Text on Dark Background</Heading>
      </div>
    </>
  ),
};
