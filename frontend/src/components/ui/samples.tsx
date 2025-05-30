import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tabs from '@radix-ui/react-tabs'
import * as Avatar from '@radix-ui/react-avatar'
import { Button } from './button'
import { Toggle } from './Toggle'
import { TwoColumnLayout } from '../layout/TwoColumnLayout'
import { OptionsSlider } from '../OptionSlider'
import './samples.css'

export const Samples: React.FC = () => {
  const [selectedTheme, _setSelectedTheme] = useState('light')

//   const themeOptions = [
//     { value: 'light', icon: '🌞' },
//     { value: 'solarized', icon: '🌕' },
//     { value: 'solarized-dark', icon: '🌒' },
//     { value: 'dark', icon: '🌚' },
//   ]

  return (
    <div className="samples">
      <section className="samples__section">
        <h2>Options Slider</h2>
        <div className="theme-slider__group">
          <OptionsSlider
          />
          <p className="theme-slider__label">Current theme: {selectedTheme}</p>
        </div>
      </section>

      <section className="samples__section">
        <h2>Toggle Showcase</h2>
        <TwoColumnLayout
          leftContent={
            <div className="toggle__group">
              <h3>Basic Toggle</h3>
              <Toggle id="t1" label="Accept terms and conditions" />
              <Toggle 
                id="t2" 
                label="Subscribe to newsletter (must be registered!)" 
                defaultPressed 
                disabled 
              />
            </div>
          }
          rightContent={
            <div className="toggle__group">
              <h3>Toggle with Different States</h3>
              <Toggle 
                id="t3" 
                label="Enable dark mode" 
                defaultPressed={true}
              />
              <Toggle 
                id="t4" 
                label="Enable notifications" 
                disabled={true}
              />
            </div>
          }
        />
      </section>
      
      <section className="samples__section">
        <h2>Dialog</h2>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="default">Open Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog__overlay" />
            <Dialog.Content className="dialog__content">
              <Dialog.Title className="dialog__title">Dialog Title</Dialog.Title>
              <Dialog.Description className="dialog__description">
                This is a sample dialog with different variations.
              </Dialog.Description>
              <div className="dialog__footer">
                <Dialog.Close asChild>
                  <Button variant="secondary">Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button variant="default">Confirm</Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </section>

      <section className="samples__section">
        <h2>Dropdown Menu</h2>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="dropdown__content" sideOffset={5}>
              <DropdownMenu.Item className="dropdown__item">
                New Tab
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown__item">
                New Window
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="dropdown__separator" />
              <DropdownMenu.Item className="dropdown__item" disabled>
                Share
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </section>

      <section className="samples__section">
        <h2>Tabs</h2>
        <Tabs.Root className="tabs" defaultValue="tab1">
          <Tabs.List className="tabs__list">
            <Tabs.Trigger className="tabs__trigger" value="tab1">
              Tab 1
            </Tabs.Trigger>
            <Tabs.Trigger className="tabs__trigger" value="tab2">
              Tab 2
            </Tabs.Trigger>
            <Tabs.Trigger className="tabs__trigger" value="tab3">
              Tab 3
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="tabs__content" value="tab1">
            Content for Tab 1
          </Tabs.Content>
          <Tabs.Content className="tabs__content" value="tab2">
            Content for Tab 2
          </Tabs.Content>
          <Tabs.Content className="tabs__content" value="tab3">
            Content for Tab 3
          </Tabs.Content>
        </Tabs.Root>
      </section>

      <section className="samples__section">
        <h2>Avatar</h2>
        <div className="avatar__group">
          <Avatar.Root className="avatar">
            <Avatar.Image
              className="avatar__image"
              src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
              alt="User"
            />
            <Avatar.Fallback className="avatar__fallback" delayMs={600}>
              U
            </Avatar.Fallback>
          </Avatar.Root>

          <Avatar.Root className="avatar avatar--large">
            <Avatar.Image
              className="avatar__image"
              src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
              alt="User"
            />
            <Avatar.Fallback className="avatar__fallback" delayMs={600}>
              JD
            </Avatar.Fallback>
          </Avatar.Root>
        </div>
      </section>

    </div>
  )
}
