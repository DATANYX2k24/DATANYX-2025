# Moon Texture Sources

## Recommended NASA Textures (Free for Educational Use)

For the best visual quality, download these high-resolution moon textures from NASA:

### 1. Moon Color Map
- **Source**: [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=4720)
- **File**: `lroc_color_poles_1k.jpg` or `lroc_color_poles_4k.jpg`
- **License**: NASA Open Data Policy (Free to use)
- **Save as**: `public/assets/textures/moon_color.jpg`

### 2. Moon Normal Map
- **Source**: [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=4720)
- **File**: `ldem_3_8bit.jpg` or convert displacement to normal map
- **License**: NASA Open Data Policy (Free to use)
- **Save as**: `public/assets/textures/moon_normal.jpg`

### 3. Moon Displacement Map (Optional)
- **Source**: [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=4720)
- **File**: `ldem_3.jpg` - Lunar topographic data
- **License**: NASA Open Data Policy (Free to use)
- **Save as**: `public/assets/textures/moon_disp.jpg`

## Alternative Sources

### Free Alternatives:
1. **Solar System Scope**: [Free moon textures](https://www.solarsystemscope.com/textures/)
2. **Planet Pixel Emporium**: High-quality planetary textures
3. **OpenGameArt**: Community-created moon textures

### Commercial Options:
1. **CGTextures** (now Textures.com)
2. **Poliigon**
3. **Quixel Megascans**

## Usage Notes

1. **Performance**: Use 1K textures for most devices, 2K for high-end
2. **Format**: JPG for color/displacement, PNG for normal maps with alpha
3. **Optimization**: Compress textures to reduce file size
4. **Fallback**: The moon module includes gray fallback if textures fail to load

## Legal Notice

- NASA textures are in the public domain and free to use
- Always verify licensing for commercial projects
- Credit sources when appropriate
- Some third-party sites may have different licensing terms

## Installation

1. Download textures from NASA CGI Moon Kit
2. Rename and place in `public/assets/textures/`
3. Ensure files are named exactly:
   - `moon_color.jpg`
   - `moon_normal.jpg` 
   - `moon_disp.jpg` (optional)