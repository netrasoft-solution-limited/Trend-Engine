import { BellIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { orgUsers } from '../data/orgs';
import { notificationsForOrg, publicationsForOrg } from '../data/publications';
import { usePortalSession } from './session';

interface PortalHeaderProps {
  onMenuOpen: () => void;
  onProfileOpen: () => void;
  profileOpen: boolean;
}

export function PortalHeader({ onMenuOpen, onProfileOpen, profileOpen }: PortalHeaderProps) {
  const { orgId, orgName, userName, role } = usePortalSession();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const wasProfileOpen = useRef(false);
  const unread = notificationsForOrg(orgId).filter((n) => !n.read).length;
  const user = orgUsers.find((member) => member.orgId === orgId && member.name === userName);
  const profileName = userName || user?.email || 'Account';
  const initials = profileName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();
  const results = query.length >= 2 && searchQuery.length >= 2 ?
  publicationsForOrg(orgId).filter((publication) => publication.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) :
  [];

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(query), 200);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (searchExpanded) inputRef.current?.focus();
  }, [searchExpanded]);

  useEffect(() => {
    if (wasProfileOpen.current && !profileOpen) profileButtonRef.current?.focus();
    wasProfileOpen.current = profileOpen;
  }, [profileOpen]);

  const openResult = (index: number) => {
    const result = results[index];
    if (!result) return;
    navigate(`/portal/output/${result.id}`);
    setSearchOpen(false);
    setSearchExpanded(false);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-card px-3">
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink lg:hidden">

        <MenuIcon className="h-4 w-4" />
      </button>

      <p className={`shrink-0 text-sm font-bold text-ink ${searchExpanded ? 'hidden sm:block' : ''}`}>{orgName}</p>

      <div ref={searchRef} className={`relative ${searchExpanded ? 'flex flex-1' : 'hidden'} lg:flex lg:max-w-xl lg:flex-1`}>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
            setActiveResult(0);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && results.length) {
              event.preventDefault();
              setActiveResult((index) => (index + 1) % results.length);
            }
            if (event.key === 'ArrowUp' && results.length) {
              event.preventDefault();
              setActiveResult((index) => (index - 1 + results.length) % results.length);
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              openResult(activeResult);
            }
            if (event.key === 'Escape') setSearchOpen(false);
          }}
          placeholder="Search published outputs"
          className="h-9 w-full rounded-xl bg-shell py-2 pl-9 pr-9 text-xs text-ink placeholder:text-ink-mute focus:outline-none" />

        {query &&
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setSearchQuery('');
            setSearchOpen(false);
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-ink-mute transition-colors duration-150 hover:bg-card hover:text-ink">

          <XIcon className="h-3.5 w-3.5" />
        </button>
        }

        {searchOpen && query.length >= 2 && searchQuery.length >= 2 &&
        <div className="absolute left-0 top-full z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-card p-1 shadow-lg">
            {results.length ?
          <ul>
                {results.map((result, index) =>
            <li key={result.id}>
                    <button
                type="button"
                onMouseEnter={() => setActiveResult(index)}
                onClick={() => openResult(index)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
                index === activeResult ? 'bg-shell' : 'hover:bg-shell'}`}>

                      <span className="truncate text-xs font-semibold text-ink">{result.title}</span>
                      <span className="text-2xs text-ink-mute">{result.publishedAt}</span>
                    </button>
                  </li>
            )}
              </ul> :
          <p className="px-2.5 py-2 text-xs text-ink-mute">No results</p>
          }
          </div>
        }
      </div>

      {!searchExpanded &&
      <button
        type="button"
        onClick={() => setSearchExpanded(true)}
        aria-label="Search published outputs"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink lg:hidden">

        <SearchIcon className="h-4 w-4" />
      </button>
      }

      <div className="ml-auto flex items-center gap-2">
        <NavLink
          to="/portal/notifications"
          aria-label={`Notifications, ${unread} unread`}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink">

          <BellIcon className="h-4 w-4" />
          {unread > 0 && <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />}
        </NavLink>

        <button
          ref={profileButtonRef}
          type="button"
          onClick={onProfileOpen}
          aria-label={`Open profile for ${profileName}`}
          className="flex h-9 items-center gap-2 rounded-xl bg-shell p-1 text-ink-soft transition-colors duration-150 hover:text-ink sm:max-w-52 sm:pr-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-2xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden min-w-0 text-left leading-tight sm:block">
            <span className="block truncate text-xs font-semibold text-ink">{profileName}</span>
            <span className="block truncate text-2xs text-ink-mute">{role}</span>
          </span>
        </button>
      </div>
    </header>);

}
