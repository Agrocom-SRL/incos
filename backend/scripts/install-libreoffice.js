#!/usr/bin/env node
/**
 * Script de instalación de LibreOffice
 * 
 * Detecta la plataforma y ejecuta el comando de instalación apropiado.
 * 
 * Uso:
 *   node scripts/install-libreoffice.js
 *   npm run setup:libreoffice
 */

import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform();

console.log('🔍 Detectando plataforma...');
console.log(`📦 Plataforma: ${platform}`);

function checkLibreOfficeInstalled() {
  try {
    if (platform === 'darwin') {
      // macOS
      const macPaths = [
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        '/usr/local/bin/soffice',
      ];
      
      for (const path of macPaths) {
        try {
          execSync(`"${path}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
          console.log(`✅ LibreOffice ya está instalado en: ${path}`);
          return true;
        } catch (error) {
          continue;
        }
      }
      
      // Intentar con comando en PATH
      try {
        execSync('soffice --version', { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ LibreOffice ya está instalado (en PATH)');
        return true;
      } catch (error) {
        return false;
      }
    } else {
      // Linux
      try {
        execSync('soffice --version', { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ LibreOffice ya está instalado');
        return true;
      } catch (error) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
}

function installLibreOffice() {
  console.log('\n📥 Instalando LibreOffice...\n');

  try {
    if (platform === 'darwin') {
      // macOS - usar Homebrew
      console.log('🍺 Usando Homebrew para instalar LibreOffice...');
      
      // Verificar que Homebrew está instalado
      try {
        execSync('brew --version', { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error) {
        console.error('❌ Error: Homebrew no está instalado.');
        console.error('   Instala Homebrew primero: https://brew.sh');
        console.error('   Luego ejecuta: brew install --cask libreoffice');
        process.exit(1);
      }
      
      // Instalar LibreOffice
      console.log('⏳ Ejecutando: brew install --cask libreoffice');
      execSync('brew install --cask libreoffice', { stdio: 'inherit' });
      console.log('\n✅ LibreOffice instalado exitosamente');
      
    } else if (platform === 'linux') {
      // Detectar distribución Linux
      let distro = 'unknown';
      try {
        const osRelease = execSync('cat /etc/os-release', { encoding: 'utf-8' });
        if (osRelease.includes('Ubuntu') || osRelease.includes('Debian')) {
          distro = 'debian';
        } else if (osRelease.includes('CentOS') || osRelease.includes('RHEL') || osRelease.includes('Fedora')) {
          distro = 'rhel';
        }
      } catch (error) {
        console.warn('⚠️  No se pudo detectar la distribución Linux');
      }
      
      if (distro === 'debian') {
        console.log('🐧 Detectado: Ubuntu/Debian');
        console.log('⏳ Ejecutando: sudo apt-get update && sudo apt-get install -y libreoffice');
        console.log('\n⚠️  Necesitas permisos de administrador (sudo)');
        execSync('sudo apt-get update && sudo apt-get install -y libreoffice', { stdio: 'inherit' });
        console.log('\n✅ LibreOffice instalado exitosamente');
      } else if (distro === 'rhel') {
        console.log('🐧 Detectado: CentOS/RHEL/Fedora');
        console.log('⏳ Ejecutando: sudo yum install -y libreoffice');
        console.log('\n⚠️  Necesitas permisos de administrador (sudo)');
        execSync('sudo yum install -y libreoffice', { stdio: 'inherit' });
        console.log('\n✅ LibreOffice instalado exitosamente');
      } else {
        console.error('❌ No se pudo detectar la distribución Linux');
        console.error('   Por favor, instala LibreOffice manualmente:');
        console.error('   - Ubuntu/Debian: sudo apt-get install libreoffice');
        console.error('   - CentOS/RHEL: sudo yum install libreoffice');
        process.exit(1);
      }
    } else {
      console.error(`❌ Plataforma no soportada: ${platform}`);
      console.error('   Por favor, instala LibreOffice manualmente según tu sistema operativo.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error al instalar LibreOffice:', error.message);
    console.error('\n💡 Instalación manual:');
    if (platform === 'darwin') {
      console.error('   brew install --cask libreoffice');
    } else if (platform === 'linux') {
      console.error('   Ubuntu/Debian: sudo apt-get install libreoffice');
      console.error('   CentOS/RHEL: sudo yum install libreoffice');
    }
    process.exit(1);
  }
}

// Verificar si ya está instalado
if (checkLibreOfficeInstalled()) {
  console.log('\n✨ LibreOffice ya está instalado. No es necesario instalarlo nuevamente.');
  process.exit(0);
}

// Instalar
installLibreOffice();

// Verificar instalación
console.log('\n🔍 Verificando instalación...');
if (checkLibreOfficeInstalled()) {
  console.log('\n🎉 ¡LibreOffice instalado y verificado correctamente!');
} else {
  console.error('\n⚠️  LibreOffice fue instalado pero no se puede verificar.');
  console.error('   Por favor, verifica manualmente: soffice --version');
}
