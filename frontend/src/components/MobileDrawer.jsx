import React from 'react';
import { Drawer } from 'vaul';
import DetailPanel from './DetailPanel';

export default function MobileDrawer({ isOpen, onClose, dish }) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[96vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none">
          {/* Handle for dragging */}
          <div className="p-4 bg-white rounded-t-[10px] flex-shrink-0">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-2" />
          </div>
          
          {/* Content */}
          <div className="flex-1 bg-white overflow-hidden relative">
            <DetailPanel dish={dish} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
