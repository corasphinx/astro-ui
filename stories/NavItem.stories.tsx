import React from 'react';
import { Meta } from '@storybook/react';
import { NavItem } from 'components/navitem/NavItem';

export default {
  title: 'Components/NavItem',
  component: NavItem,
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    nextRouter: {
      pathname: '/',
      asPath: '/'
    }
  }
} as Meta;

export const Template = (
  args: React.ComponentProps<typeof NavItem>
): JSX.Element => {
  return <NavItem {...args} />;
};

Template.storyName = 'NavItem';

Template.args = {
  href: '#',
  icon: 'stateGear',
  label: 'Option'
};
