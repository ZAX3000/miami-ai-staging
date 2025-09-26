import React from 'react';
import { MiamiLogo } from './logos/miami-logo';

export const MiamiLogoHeader = () => (
  <div className="flex items-center gap-2 my-1.5">
    <MiamiLogo className="size-7" />
    <h2 className="text-xl font-normal font-be-vietnam-pro text-foreground dark:text-foreground">Miami</h2>
  </div>
);
