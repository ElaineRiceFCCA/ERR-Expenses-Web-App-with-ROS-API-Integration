<script lang="ts">
  import { onMount } from 'svelte';
  import L from 'leaflet';
  // import 'leaflet/dist/leaflet.css';

  export let rides: any[] = [];

  let mapContainer: HTMLDivElement;

  onMount(() => {
    const map = L.map(mapContainer).setView([53.35, -6.26], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    rides.forEach((ride) => {
      const lat = parseFloat(ride.lat);
      const lng = parseFloat(ride.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const popupContent = `
          <strong>Location:</strong> ${ride.locationid?.title || 'Unknown'}<br/>
          <strong>Achievement:</strong> ${ride.achievement || 'None'}<br/>
          <strong>Date:</strong> ${ride.date ? new Date(ride.date).toLocaleDateString() : 'Unknown'}
        `;

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(popupContent);
      }
    });
  });
</script>

<div bind:this={mapContainer} style="height: 500px; width: 100%;"></div>
