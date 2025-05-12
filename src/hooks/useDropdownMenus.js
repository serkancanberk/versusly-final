import { useState, useRef, useEffect } from 'react';

export function useDropdownMenus() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const menuTimeoutRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  
  const menuRefs = {
    react: useRef(null),
    share: useRef(null),
    Clash_arguments: useRef(null)
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      
      const insideReactMenu = menuRefs.react.current && 
                             menuRefs.react.current.contains(event.target);
      const insideShareMenu = menuRefs.share.current && 
                             menuRefs.share.current.contains(event.target);
      const insideClashArgumentsMenu = menuRefs.Clash_arguments.current &&
                                      menuRefs.Clash_arguments.current.contains(event.target);
      
      if (!insideReactMenu && !insideShareMenu && !insideClashArgumentsMenu) {
        setActiveMenu(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleReactButtonHover = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu("react");
    }, 300);
  };

  const handleClashArgumentsButtonHover = () => {
    setActiveMenu("Clash_arguments");
  };

  const handleButtonMouseLeave = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
  };

  return {
    showDropdown,
    activeMenu,
    copied,
    dropdownRef,
    menuRefs,
    setActiveMenu,
    setCopied,
    toggleDropdown,
    handleReactButtonHover,
    handleClashArgumentsButtonHover,
    handleButtonMouseLeave,
    menuTimeoutRef,
    copyTimeoutRef
  };
} 