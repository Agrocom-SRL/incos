#!/usr/bin/env python3
"""
Script para corregir TODAS las importaciones en index.js
Compara con los nombres reales de archivos en el mismo directorio
"""
import os
import re
import glob
from pathlib import Path

def fix_index_imports():
    """Corrige todas las importaciones en archivos index.js"""
    fixed_count = 0
    files_fixed = []
    
    # Buscar todos los index.js
    search_paths = [
        'frontend/src/presentation/components',
        'frontend/src/presentation/templates',
        'frontend/src/presentation/modules',
        'frontend/src/presentation/pages',
    ]
    
    for search_path in search_paths:
        if not os.path.exists(search_path):
            continue
        
        for index_file in Path(search_path).rglob('index.js'):
            index_path = str(index_file)
            dir_path = os.path.dirname(index_path)
            
            # Leer el contenido
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            changes = []
            
            # Buscar importaciones del tipo: from './nombre'
            pattern = r"from\s+['\"]\.\.?/([^'\"]+)['\"]"
            matches = list(re.finditer(pattern, content))
            
            if not matches:
                continue
            
            # Buscar archivos .jsx y .js en el mismo directorio
            jsx_files = glob.glob(os.path.join(dir_path, "*.jsx"))
            js_files = glob.glob(os.path.join(dir_path, "*.js"))
            all_files = jsx_files + js_files
            
            # Crear un mapa de nombres (case-insensitive) a nombres reales
            file_map = {}
            for file_path in all_files:
                basename = os.path.basename(file_path)
                name_without_ext = os.path.splitext(basename)[0]
                name_lower = name_without_ext.lower()
                
                if name_lower not in file_map:
                    file_map[name_lower] = name_without_ext
            
            # Corregir cada importación (de atrás hacia adelante para no afectar índices)
            for match in reversed(matches):
                import_name = match.group(1)
                import_lower = import_name.lower()
                
                if import_lower in file_map:
                    actual_name = file_map[import_lower]
                    if actual_name != import_name:
                        old_import = match.group(0)
                        new_import = f"from './{actual_name}'"
                        content = content[:match.start()] + new_import + content[match.end():]
                        changes.append((import_name, actual_name))
            
            # Guardar si hubo cambios
            if content != original_content:
                with open(index_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                files_fixed.append(index_path)
                fixed_count += len(changes)
                rel_path = str(Path(index_path).relative_to('frontend/src'))
                print(f"✓ {rel_path}")
                for old, new in changes:
                    print(f"  './{old}' -> './{new}'")
    
    print(f"\n✅ Corrección completada!")
    print(f"   Archivos corregidos: {len(files_fixed)}")
    print(f"   Total de cambios: {fixed_count}")
    
    return len(files_fixed)

if __name__ == "__main__":
    fix_index_imports()


