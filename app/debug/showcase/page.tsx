'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ATSFlow Design System
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Phase 4 Complete: Comprehensive UI Component Library ✅
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>Inputs, Selects, and Textareas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input type="email" id="email" placeholder="name@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="role">Role</Label>
                   <Select id="role">
                     <option value="">Select a role</option>
                     <option value="dev">Developer</option>
                     <option value="design">Designer</option>
                     <option value="pm">Product Manager</option>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="error-input">Error State</Label>
                   <Input id="error-input" placeholder="Invalid input" error />
                   <p className="text-xs text-red-500">This field is required</p>
                </div>
              </CardContent>
            </Card>

            {/* Toggles & Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Toggles & Selection</CardTitle>
                    <CardDescription>Switches, Checkboxes, and Dropdowns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">Enable Notifications</Label>
                        <Switch 
                            id="notifications" 
                            checked={switchChecked} 
                            onCheckedChange={setSwitchChecked} 
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Checkbox 
                            id="terms" 
                            checked={checkboxChecked} 
                            onCheckedChange={setCheckboxChecked} 
                        />
                        <Label htmlFor="terms" className="cursor-pointer">I accept the terms and conditions</Label>
                    </div>

                    <div className="pt-4">
                        <Label className="block mb-2">Dropdown Menu</Label>
                        <Dropdown trigger={<Button variant="secondary">Options ▼</Button>}>
                            <DropdownItem onClick={() => addToast({ title: 'Clicked Profile' })}>Profile</DropdownItem>
                            <DropdownItem onClick={() => addToast({ title: 'Clicked Settings' })}>Settings</DropdownItem>
                            <DropdownItem className="text-red-500" onClick={() => addToast({ title: 'Clicked Logout', variant: 'danger' })}>Logout</DropdownItem>
                        </Dropdown>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Visual Elements */}
        <Card>
            <CardHeader>
                <CardTitle>Visual Elements</CardTitle>
                <CardDescription>Avatars and Skeletons</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-8 items-center">
                    <div className="space-y-2">
                        <Label>Avatars</Label>
                        <div className="flex gap-4 items-end">
                             <Avatar size="sm" fallback="SM" />
                             <Avatar size="md" fallback="MD" />
                             <Avatar size="lg" src="https://github.com/shadcn.png" fallback="LG" />
                             <Avatar size="xl" fallback="XL" />
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 min-w-[200px]">
                        <Label>Skeletons (Loading State)</Label>
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Existing Components (Buttons, Badges etc) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>All button variants with states</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" isLoading>Loading</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="pro">Pro</Badge>
              </CardContent>
            </Card>
        </div>

        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            description="This is a description for the modal."
        >
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Modals are useful for dialogs, confirmations, or complex forms that shouldn't clutter the main interface.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
                </div>
            </div>
        </Modal>

        <div className="flex justify-center">
            <Button size="lg" onClick={() => setIsModalOpen(true)}>Open Test Modal</Button>
        </div>

      </div>
    </div>
  );
}
